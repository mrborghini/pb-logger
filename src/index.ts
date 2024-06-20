import PocketBase from "pocketbase";

type ErrorType = "error" | "warning" | "log";
type ErrorMessage = {
  type: ErrorType;
  message: any;
};

export abstract class Logger {
  private static pb: PocketBase | null = null;
  private static application: string | null = null;
  private static errorQueue: ErrorMessage[] = [];

  static async init(app: string, key: string, pocketbaseUrl: string) {
    this.pb = new PocketBase(pocketbaseUrl);
    await this.pb.collection("users").authWithPassword(app, key);

    if (!this.pb.authStore.isValid) {
      return console.error(
        "Logger not set up correctly. Incorrect app or key."
      );
    }
    this.application = this.pb.authStore.model?.id;
  }

  private static async registerMessage(message: any, type: ErrorType) {
    this.errorQueue.push({ message, type });
    if (this.pb === null || this.application === null) return;

    this.errorQueue.forEach((error) => {
      this.pb?.collection("errors").create({
        message: error.message,
        application: this.application,
        type: error.type,
      });
    });
  }

  static async log(message: any) {
    return await this.registerMessage(message, "log");
  }

  static async error(message: any) {
    return await this.registerMessage(message, "error");
  }

  static async warning(message: any) {
    return await this.registerMessage(message, "warning");
  }
}
