import * as cdk from "aws-cdk-lib";
import { LambdaConstruct } from "./lambda/lambda-construct";
import { CloudfrontConstruct } from "./cloudfront/cloudfront-construct";
import { ApiGatewayConstruct } from "./apigw/apigw-construct";

export class App extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
		super(scope, id, props);
		
		new CloudfrontConstruct(this, "CloudfrontConstruct")

		const { handler} = new LambdaConstruct(this, "LambdaFunction");

		new ApiGatewayConstruct(this, "ApiGatewayConstruct", {
			lambdaFunction: handler
		})
	}
}
