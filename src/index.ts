import PocketBase from "pocketbase";

type ErrorType = "error" | "warning" | "log";

export abstract class Logger {
  private static pb: PocketBase | null = null;
  private static application: string | null = null;

  static async init(app: string, key: string) {
    this.pb = new PocketBase("https://errors.exploretriple.com");
    await this.pb.collection("users").authWithPassword(app, key);

    if (!this.pb.authStore.isValid) {
      return console.error(
        "Logger not set up correctly. Incorrect app or key."
      );
    }
    this.application = this.pb.authStore.model?.id;
  }

  private static async registerMessage(message: any, type: ErrorType) {
    if (this.pb === null || this.application === null)
      return console.error("Logger not registered. Missing app or key");

    this.pb
      .collection("errors")
      .create({ message, application: this.application, type });
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
