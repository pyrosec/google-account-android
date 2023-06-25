import nodecallspython from "node-calls-python";
import { getLogger } from "./logger";
export declare const py: nodecallspython.Interpreter;
export declare const timeout: (n: any) => Promise<unknown>;
export declare function getOTP(token: any, fn: any, goBack: any): Promise<any>;
export declare class GoogleAccountAndroid {
    googleAccountViewClient: any;
    logger: ReturnType<typeof getLogger>;
    static initialize(): Promise<GoogleAccountAndroid>;
    getOTP(fn: any, goBack: any): Promise<any>;
    getOTPFromSmsPinVerify(fn: any, goBack: any, app?: string, ticks?: number): Promise<any>;
    hasViewWithText(text: any): Promise<boolean>;
    static createAccount({ username, password, name, pin, smspinverify }: {
        username: any;
        password: any;
        name: any;
        pin: any;
        smspinverify: any;
    }): Promise<void>;
}
