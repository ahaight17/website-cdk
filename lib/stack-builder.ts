import * as cdk from "aws-cdk-lib";
import { LambdaConstruct } from "./lambda/lambda-construct";
import { CloudfrontConstruct } from "./cloudfront/cloudfront-construct";
import { ApiGatewayConstruct } from "./apigw/apigw-construct";
import { DnsConstruct } from "./dns/dns-construct";
import { DnsRecordsConstruct } from "./dns/dns-records-construct";

export class App extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
		super(scope, id, props);

		const { zone, certificate } = new DnsConstruct(this, "DnsConstruct");

		const { lambdaFunction} = new LambdaConstruct(this, "LambdaFunction");
		
		const { distribution } = new CloudfrontConstruct(this, "CloudfrontConstruct", {
			certificate,
			lambdaFunction
		});

		const { api } = new ApiGatewayConstruct(this, "ApiGatewayConstruct", {
			lambdaFunction,
			certificate
		});

		new DnsRecordsConstruct(this, "DnsRecordsConstruct", {
			zone,
			distribution,
			api
		});
	}
}
