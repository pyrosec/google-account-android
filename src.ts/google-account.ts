import nodecallspython from "node-calls-python";
import { memoize } from "lodash";
import { TextVerifiedClient } from "textverified";
import { getLogger } from "./logger";
import { SmsPinVerifyClient } from "smspinverify";

export const py = nodecallspython.interpreter;

export const timeout = async (n) => await new Promise((resolve) => setTimeout(resolve, n));


export async function getOTP(token, fn, goBack) {
  const textVerified = new TextVerifiedClient({
    simpleAccessToken: token,
  });
  await textVerified.simpleAuthenticate();
  const code = await (async () => {
    while (true) {
      const verification = await (async () => {
        while (true) {
          try {
            return await textVerified.createVerification({ id: 33 } as any);
          } catch (e) {
            this.logger.error(e);
            await timeout(30000);
            this.logger.error("retry");
          }
        }
      })();
      const poll = async () => {
        await fn(verification.number);
        await timeout(1000);
	if (await this.hasViewWithText("This phone number has been used too many times")) return false;
        if (await this.hasViewWithText("This phone number cannot be used for verification.")) return false;
        for (let i = 0; i < 10; i++) {
          this.logger.info("poll OTP ...");
          const status = await textVerified.getVerification({
            id: verification.id,
          });
          if (status.code) {
            this.logger.info("got OTP: " + status.code);
            return status.code;
          }
          await timeout(1000);
        }
        return false;
      };
      const result = await poll();
      if (!result) {
        await goBack();
        await timeout(1000);
        continue;
      }
      return result;
    }
  })();
  return code;
};

const getOTPFromSmsPinVerify = async function (
  token,
  fn,
  goBack,
  app: string = "Gmail USA",
  ticks: number = 10
) {
  const smspinverify = new SmsPinVerifyClient({
    apiKey: token,
  });
  const code = await (async () => {
    while (true) {
      const verification = await (async () => {
        while (true) {
          try {
            return {
              number: await smspinverify.getNumber({
                country: "USA",
                app,
              }),
            };
          } catch (e) {
            this.logger.error(e);
            await timeout(30000);
            this.logger.error("retry");
          }
        }
      })();
      const poll = async () => {
        await fn(verification.number);
        await timeout(1000);
	if (await this.hasViewWithText("This phone number has been used too many times")) return false;
	if (await this.hasViewWithText("This phone number cannot be used for verification.")) return false;
        for (let i = 0; i < ticks; i++) {
          this.logger.info("poll OTP ...");
          const status = await smspinverify.getSms({
            country: "USA",
            app,
            number: verification.number,
          });
          const match = status.match(/(?:\d{6})/g);
          if (match) {
            const code = match[0].replace("G-", "");
            this.logger.info("got OTP: " + code);
            return code;
          }
          await timeout(1000);
        }
        return false;
      };
      const result = await poll();
      if (!result) {
        try {
          await goBack();
        } catch (e) {
          this.logger.info("back button failed, trying anyway to proceed");
        }
        await timeout(1000);
        continue;
      }
      return result;
    }
  })();
  return code;
};

export class GoogleAccountAndroid {
  public googleAccountViewClient: any;
  public logger: ReturnType<typeof getLogger>;
  static async initialize() {
    const pymodule = await py.import("python/google_account.py");
    const result = new this();
    result.googleAccountViewClient = await py.create(pymodule, "GoogleAccountViewClient");
    result.logger = getLogger();
    return result;
  }
  async getOTP(fn, goBack) {
    return await getOTP.call(this, process.env.TEXTVERIFIED_TOKEN, fn, goBack);
  }
  async getOTPFromSmsPinVerify(
    fn,
    goBack,
    app: string = "Gmail USA",
    ticks: number = 10
  ) {
    return await getOTPFromSmsPinVerify.call(
      this,
      process.env.SMSPINVERIFY_TOKEN,
      fn,
      goBack,
      app,
      ticks
    );
  }
  async hasViewWithText(text) {
    return Boolean(await py.call(this.googleAccountViewClient, "has_view_with_text", text));
  }
  static async createAccount({
    username,
    password,
    name,
    pin,
    smspinverify
  }) {
    const googleAccount = await this.initialize();
    if (smspinverify) googleAccount.getOTP = googleAccount.getOTPFromSmsPinVerify;
    const [ firstName, lastName ] = name.split(/\s/);
    googleAccount.logger.info('add Google account view');
    await py.call(googleAccount.googleAccountViewClient, "goto_add_google", pin || "000000");
    googleAccount.logger.info('wait 10s');
    await timeout(10000);
    googleAccount.logger.info('first phase of workflow');
    await py.call(googleAccount.googleAccountViewClient, "setup", username, password, firstName, lastName);
    if (!await googleAccount.hasViewWithText("Skip")) {
      await py.call(googleAccount.googleAccountViewClient, "enter_otp", await googleAccount.getOTP(async (number) => {
        await py.call(googleAccount.googleAccountViewClient, "enter_verification_number", "+1" + number);
      }, async () => {}) );
    }
    await timeout(5000);
    await py.call(googleAccount.googleAccountViewClient, "finish_workflow");
  }
}
