"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAccountAndroid = exports.getOTP = exports.timeout = exports.py = void 0;
const node_calls_python_1 = __importDefault(require("node-calls-python"));
const textverified_1 = require("textverified");
const logger_1 = require("./logger");
const smspinverify_1 = require("smspinverify");
exports.py = node_calls_python_1.default.interpreter;
const timeout = async (n) => await new Promise((resolve) => setTimeout(resolve, n));
exports.timeout = timeout;
async function getOTP(token, fn, goBack) {
    const textVerified = new textverified_1.TextVerifiedClient({
        simpleAccessToken: token,
    });
    await textVerified.simpleAuthenticate();
    const code = await (async () => {
        while (true) {
            const verification = await (async () => {
                while (true) {
                    try {
                        return await textVerified.createVerification({ id: 33 });
                    }
                    catch (e) {
                        this.logger.error(e);
                        await (0, exports.timeout)(30000);
                        this.logger.error("retry");
                    }
                }
            })();
            const poll = async () => {
                await fn(verification.number);
                await (0, exports.timeout)(1000);
                if (await this.hasViewWithText("This phone number has been used too many times"))
                    return false;
                if (await this.hasViewWithText("This phone number cannot be used for verification."))
                    return false;
                for (let i = 0; i < 10; i++) {
                    this.logger.info("poll OTP ...");
                    const status = await textVerified.getVerification({
                        id: verification.id,
                    });
                    if (status.code) {
                        this.logger.info("got OTP: " + status.code);
                        return status.code;
                    }
                    await (0, exports.timeout)(1000);
                }
                return false;
            };
            const result = await poll();
            if (!result) {
                await goBack();
                await (0, exports.timeout)(1000);
                continue;
            }
            return result;
        }
    })();
    return code;
}
exports.getOTP = getOTP;
;
const getOTPFromSmsPinVerify = async function (token, fn, goBack, app = "Gmail USA", ticks = 10) {
    const smspinverify = new smspinverify_1.SmsPinVerifyClient({
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
                    }
                    catch (e) {
                        this.logger.error(e);
                        await (0, exports.timeout)(30000);
                        this.logger.error("retry");
                    }
                }
            })();
            const poll = async () => {
                await fn(verification.number);
                await (0, exports.timeout)(1000);
                if (await this.hasViewWithText("This phone number has been used too many times"))
                    return false;
                if (await this.hasViewWithText("This phone number cannot be used for verification."))
                    return false;
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
                    await (0, exports.timeout)(1000);
                }
                return false;
            };
            const result = await poll();
            if (!result) {
                try {
                    await goBack();
                }
                catch (e) {
                    this.logger.info("back button failed, trying anyway to proceed");
                }
                await (0, exports.timeout)(1000);
                continue;
            }
            return result;
        }
    })();
    return code;
};
class GoogleAccountAndroid {
    static async initialize() {
        const pymodule = await exports.py.import("python/google_account.py");
        const result = new this();
        result.googleAccountViewClient = await exports.py.create(pymodule, "GoogleAccountViewClient");
        result.logger = (0, logger_1.getLogger)();
        return result;
    }
    async getOTP(fn, goBack) {
        return await getOTP.call(this, process.env.TEXTVERIFIED_TOKEN, fn, goBack);
    }
    async getOTPFromSmsPinVerify(fn, goBack, app = "Gmail USA", ticks = 10) {
        return await getOTPFromSmsPinVerify.call(this, process.env.SMSPINVERIFY_TOKEN, fn, goBack, app, ticks);
    }
    async hasViewWithText(text) {
        return Boolean(await exports.py.call(this.googleAccountViewClient, "has_view_with_text", text));
    }
    static async createAccount({ username, password, name, smspinverify }) {
        const googleAccount = await this.initialize();
        if (smspinverify)
            googleAccount.getOTP = googleAccount.getOTPFromSmsPinVerify;
        const [firstName, lastName] = name.split(/\s/);
        await exports.py.call(googleAccount.googleAccountViewClient, "setup", username, password, firstName, lastName);
        if (!await googleAccount.hasViewWithText("Skip")) {
            await exports.py.call(googleAccount.googleAccountViewClient, "enter_otp", await googleAccount.getOTP(async (number) => {
                await exports.py.call(googleAccount.googleAccountViewClient, "enter_verification_number", "+1" + number);
            }, async () => { }));
        }
        await exports.py.call(googleAccount.googleAccountViewClient, "finish_workflow");
    }
}
exports.GoogleAccountAndroid = GoogleAccountAndroid;
//# sourceMappingURL=google-account.js.map