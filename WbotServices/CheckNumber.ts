import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface IOnWhatsapp {
  jid: string;
  exists: boolean;
}

const checker = async (number: string, wbot: any): Promise<IOnWhatsapp | null> => {
  try {
    const [validNumber] = await wbot.onWhatsApp(`${number}@s.whatsapp.net`);
    return validNumber || null;
  } catch (error) {
    logger.error(`Erro ao verificar número no WhatsApp: ${error}`);
    return null;
  }
};

const CheckContactNumber = async (
  number: string,
  companyId: number
): Promise<IOnWhatsapp> => {
  try {
    if (!number) {
      throw new AppError("ERR_NUMBER_REQUIRED");
    }

    const defaultWhatsapp = await GetDefaultWhatsApp(companyId);
    if (!defaultWhatsapp) {
      throw new AppError("ERR_NO_DEFAULT_WHATSAPP");
    }

    const wbot = getWbot(defaultWhatsapp.id);
    if (!wbot) {
      throw new AppError("ERR_WBOT_NOT_FOUND");
    }

    const isNumberExit = await checker(number, wbot);
    if (!isNumberExit) {
      throw new AppError("ERR_CHECK_NUMBER");
    }

    if (!isNumberExit.exists) {
      throw new AppError("ERR_NUMBER_NOT_EXISTS");
    }

    return isNumberExit;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`Erro ao verificar número: ${error}`);
    throw new AppError("ERR_CHECK_NUMBER");
  }
};

export default CheckContactNumber;
