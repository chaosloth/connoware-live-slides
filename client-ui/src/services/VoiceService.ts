import { Call, Device } from "@twilio/voice-sdk";

class VoiceService {
  device: Device | undefined = undefined;
  token: string = "";
  identity: string = "";

  async init(identity: string): Promise<Device> {
    try {
      const resp = await fetch("/api/voice/token", {
        method: "POST",
        body: JSON.stringify({ identity }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { token } = await resp.json();

      this.device = new Device(token);
      this.device.updateOptions({
        logLevel: "DEBUG",
        codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
      });

      return this.device;
    } catch (error) {
      console.error("Error initializing VoiceService:", error);
      throw error;
    }
  }

  registerDevice(): void {
    if (this.device) this.device.register();
  }

  getToken(): string {
    return this.token;
  }

  getDevice(): Device | undefined {
    return this.device;
  }
}

const service = new VoiceService();

export default service;
