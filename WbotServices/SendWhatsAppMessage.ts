import * as Sentry from "@sentry/node";
import { WAMessage } from "@whiskeysockets/baileys";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

import formatBody from "../../helpers/Mustache";
import { map_msg } from "../../utils/global";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg
}: Request): Promise<WAMessage> => {
  let options = {};
  const wbot = await GetTicketWbot(ticket);
  const number = `${ticket.contact.number}@${
    ticket.isGroup ? "g.us" : "s.whatsapp.net"
  }`;
  console.log("number", number);

  if (quotedMsg) {
    const chatMessages = await Message.findOne({
      where: {
        id: quotedMsg.id
      }
    });

    if (chatMessages) {
      const msgFound = JSON.parse(chatMessages.dataJson);

      options = {
        quoted: {
          key: msgFound.key,
          message: {
            extendedTextMessage: msgFound.message.extendedTextMessage
          }
        }
      };
    }
  }

  try {
    console.log("body:::::::::::::::::::::::::::", body);
    map_msg.set(ticket.contact.number, { lastSystemMsg: body });
    console.log(
      "lastSystemMsg:::::::::::::::::::::::::::",
      ticket.contact.number
    );

    // Adiciona timeout personalizado para grupos
    const timeout = ticket.isGroup ? 30000 : 10000; // 30 segundos para grupos, 10 para individuais

    let retryCount = 0;
    const maxRetries = 3;
    let lastError = null;

    while (retryCount < maxRetries) {
      try {
        const sentMessage = await Promise.race<WAMessage>([
          wbot.sendMessage(
            number,
            {
              text: formatBody(body, ticket.contact)
            },
            {
              ...options
            }
          ),
          new Promise<WAMessage>((_, reject) =>
            setTimeout(
              () => reject(new Error("Timeout ao enviar mensagem")),
              timeout
            )
          )
        ]);

        await ticket.update({ lastMessage: formatBody(body, ticket.contact) });
        console.log("Message sent", sentMessage);
        return sentMessage;
      } catch (err) {
        lastError = err;
        if (err.message === "Timeout ao enviar mensagem") {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(
              `Tentativa ${retryCount} falhou, tentando novamente...`
            );
            await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2 segundos antes de tentar novamente
            continue;
          }
        }
        throw err;
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    Sentry.captureException(lastError);
    console.log(lastError);
    if (lastError.message === "Timeout ao enviar mensagem") {
      throw new AppError("ERR_SENDING_WAPP_MSG_TIMEOUT");
    }
    throw new AppError("ERR_SENDING_WAPP_MSG");
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    if (err.message === "Timeout ao enviar mensagem") {
      throw new AppError("ERR_SENDING_WAPP_MSG_TIMEOUT");
    }
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
