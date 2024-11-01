type ErrorType = "error" | "warning" | "log";
type ErrorMessage = {
  type: ErrorType;
  message: any;
};
enum Colors {
  Cyan = "\x1b[96m",
  Yellow = "\x1b[93m",
  Red = "\x1b[91m",
  Default = "\x1b[0m",
}

const post = async (url: string, data: any, headers?: HeadersInit) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await response.json();
};

export abstract class Logger {
  private static token: string | null = null;
  private static pocketbaseUrl: string | null = null;
  private static application: string | null = null;
  private static errorQueue: ErrorMessage[] = [];

  static async authWithPassword(app: string, key: string) {
    const response = await post(
      `${this.pocketbaseUrl ?? ""}/api/collections/users/auth-with-password`,
      { identity: app, password: key }
    );
    this.application = response.record.id;
    this.token = response.token;
  }

  static async postMessage(message: any, type: ErrorType) {
    if (this.token === null || this.pocketbaseUrl === null) return;

    await post(
      `${this.pocketbaseUrl}/api/collections/errors/records`,
      {
        message,
        application: this.application,
        type,
      },
      {
        Authorization: this.token,
      }
    );
  }

  static async init(app: string, key: string, pocketbaseUrl: string) {
    this.pocketbaseUrl = pocketbaseUrl;
    await this.authWithPassword(app, key);
  }

  private static async registerMessage(message: any, type: ErrorType) {
    this.errorQueue.push({ message, type });
    if (
      this.token === null ||
      this.pocketbaseUrl === null ||
      this.application === null
    )
      return;

    this.errorQueue.forEach((error) => {
      this.postMessage(error.message, error.type);
    });
    this.errorQueue = [];
  }

  private static formatMessage(message: any) {
    return typeof message === 'object' ? JSON.stringify(message) : message;
  }

  static async log(message: any) {
      console.log(`${Colors.Cyan}${Logger.formatMessage(message)}${Colors.Default}`);
    return await this.registerMessage(message, "log");
  }

  static async error(message: any) {
    console.error(`${Colors.Red}${Logger.formatMessage(message)}${Colors.Default}`);
    return await this.registerMessage(message, "error");
  }

  static async warning(message: any) {
    console.warn(`${Colors.Yellow}${Logger.formatMessage(message)}${Colors.Default}`);
    return await this.registerMessage(message, "warning");
  }
}
