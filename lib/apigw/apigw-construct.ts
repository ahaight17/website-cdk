import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { DNS_CONSTANTS } from "../utils/constants";

interface ApiGatewayConstructProps {
    lambdaFunction: IFunction
    certificate: ICertificate
}

export class ApiGatewayConstruct extends Construct {
	public api: RestApi;

	constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
		super(scope, id);

		const { lambdaFunction, certificate } = props;

		this.api = new RestApi(this, "LambdaRestApi", {
			restApiName: "LambdaRestAPI",
			description: "Serves objects from S3",
			defaultCorsPreflightOptions: {
				allowOrigins: Cors.ALL_ORIGINS,
				allowMethods: Cors.ALL_METHODS
			},
			domainName: {
				domainName: DNS_CONSTANTS.apiDomain,
				certificate
			},
		});

		const fetchS3 = new LambdaIntegration(lambdaFunction);

		this.api.root.addMethod("GET", fetchS3);
          
	}
}