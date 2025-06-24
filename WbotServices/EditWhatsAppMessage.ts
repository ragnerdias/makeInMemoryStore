import GetWhatsAppWbot from "../../helpers/GetWhatsappWbot";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Whatsapp from "../../models/Whatsapp";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";

interface Request {
  messageId: string;
  body: string;
}

const EditWhatsAppMessage = async ({
  messageId,
  body
}: Request): Promise<{ message: Message; ticket: any }> => {
  const message = await Message.findOne({
    where: { id: messageId },
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: [
          {
            model: Contact,
            as: "contact"
          },
          {
            model: Whatsapp,
            as: "whatsapp"
          }
        ]
      }
    ]
  });

  if (!message) {
    throw new AppError("Message not found");
  }

  if (!message.ticket) {
    throw new AppError("Ticket not found for this message");
  }

  const whatsapp = await Whatsapp.findByPk(message.ticket.whatsappId);
  if (!whatsapp) {
    throw new AppError("Whatsapp not found");
  }

  const wbot = await GetWhatsAppWbot(whatsapp);

  try {
    const messageData = JSON.parse(message.dataJson);

    // Verificar se temos todas as propriedades necessárias
    if (!messageData.key || !messageData.key.id || !messageData.key.remoteJid) {
      throw new AppError("Invalid message data for editing");
    }

    // Usar o formato correto para edição de mensagens no Baileys
    const editedMessage = await wbot.sendMessage(messageData.key.remoteJid, {
      edit: messageData.key,
      text: body
    });

    await message.update({
      body: body,
      edited: true
    });

    return { message, ticket: message.ticket };
  } catch (err) {
    console.error(err);
    throw new AppError("Error editing message");
  }
};

export default EditWhatsAppMessage;
