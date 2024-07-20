import { SyncClient, SyncMapItem } from "twilio-sync";
import { PresentationMapItem } from "../types/LiveSlides";
import SyncHelper from "./SyncHelper";

class LiveSlidesService {
  generateRandomCode = (): string => {
    const characters = "2346789ABCDEFGHJKLMNPQRTUVWXYZ";
    let code = "";
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    return code;
  };

  generateRandomSlideId = (): string => {
    const characters = "2346789ABCDEFGHJKLMNPQRTUVWXYZ";
    let code = "";
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    return code;
  };

  getPresentationMapName = () => {
    return process.env.NEXT_PUBLIC_PRESENTATIONS_MAP_NAME || "Presentations";
  };

  getPresentation = async (
    client: SyncClient,
    pid: string
  ): Promise<SyncMapItem> => {
    let map = await client.map({
      id: this.getPresentationMapName(),
      mode: "open_existing",
    });

    return map.get(pid);
  };

  savePresentation = async (
    client: SyncClient,
    pid: string,
    data: any
  ): Promise<SyncMapItem> => {
    let map = await client.map({
      id: this.getPresentationMapName(),
      mode: "open_existing",
    });

    console.log(`Setting map item data for pid [${pid}]`, data);

    return map.set(pid, data);
  };

  getLiveSlides = async (
    client: SyncClient
  ): Promise<PresentationMapItem[]> => {
    return SyncHelper.getMapItems(client, this.getPresentationMapName());
  };
}

const service = new LiveSlidesService();

export default service;
