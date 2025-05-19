import * as cdk from "aws-cdk-lib";
import { LambdaConstruct } from "./lambda/lambda-construct";
import { WebsiteCloudfront } from "./cloudfront/website-cloudfront";
import { ApiGatewayConstruct } from "./apigw/apigw-construct";
import { DnsConstruct } from "./dns/dns-construct";
import { DnsRecordsConstruct } from "./dns/dns-records-construct";
import { CdnCloudfront } from "./cloudfront/cdn-cloudfront";

export class App extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
		super(scope, id, props);

		const { zone, certificate } = new DnsConstruct(this, "DnsConstruct");

		const { lambdaFunction} = new LambdaConstruct(this, "LambdaFunction");
		
		const { websiteDistribution } = new WebsiteCloudfront(this, "WebsiteCloudfront", {
			certificate,
			lambdaFunction
		});

		const { cdnDistribution } = new CdnCloudfront(this, "CdnCloudfront", {
			certificate,
			lambdaFunction
		});

		const { api } = new ApiGatewayConstruct(this, "ApiGatewayConstruct", {
			lambdaFunction,
			certificate
		});

		new DnsRecordsConstruct(this, "DnsRecordsConstruct", {
			zone,
			websiteDistribution,
			cdnDistribution,
			api
		});
	}
}
