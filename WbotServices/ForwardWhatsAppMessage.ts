import * as Sentry from "@sentry/node";
import { WAMessage, proto } from "@whiskeysockets/baileys";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  messageId: string;
  ticketId: number;
  destinationNumbers: string[];
}

const ForwardWhatsAppMessage = async ({
  messageId,
  ticketId,
  destinationNumbers
}: Request): Promise<void> => {
  try {
    const message = await Message.findByPk(messageId, {
      include: [
        {
          model: Ticket,
          as: "ticket",
          include: ["contact", { model: Whatsapp, as: "whatsapp" }]
        }
      ]
    });

    if (!message) {
      throw new AppError("No message found with this ID.");
    }

    const wbot = await GetTicketWbot(message.ticket);
    const rawMessage = JSON.parse(message.dataJson);

    for (const number of destinationNumbers) {
      const chatId = `${number}@s.whatsapp.net`;
      await wbot.sendMessage(chatId, {
        forward: rawMessage as proto.IWebMessageInfo
      });
    }
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_FORWARDING_WAPP_MSG");
  }
};

export default ForwardWhatsAppMessage;
