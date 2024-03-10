import { Code, Function, IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path = require("path");

export class LambdaConstruct extends Construct {
	public handler: IFunction

	constructor(scope: Construct, id: string) {
		super(scope, id);

		const handler = new Function(this, "S3LambdaHandler", {
			runtime: Runtime.NODEJS_18_X,
			handler: "handler.handler",
			code: Code.fromAsset(path.join(__dirname)),
		})

		this.handler = handler
	}
}