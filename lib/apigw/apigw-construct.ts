import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { DNS_CONSTANTS } from "../utils/constants";

interface ApiGatewayConstructProps {
    lambdaFunction: IFunction
    certificate: ICertificate
}

export class ApiGatewayConstruct extends Construct {
    public api: RestApi

    constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
        super(scope, id);

        const { lambdaFunction, certificate } = props

        this.api = new RestApi(this, "LambdaRestApi", {
            restApiName: "LambdaRestAPI",
            description: "Serves objects from S3",
            domainName: {
                domainName: DNS_CONSTANTS.apiDomain,
                certificate
            }
        })

        this.api.addUsagePlan("UsagePlane", {
            throttle: {
                rateLimit: 10,
                burstLimit: 3
            }
        })

        const fetchS3 = new LambdaIntegration(lambdaFunction)

        this.api.root.addMethod("GET", fetchS3)

        this.api.root.addCorsPreflight({
            allowOrigins: DNS_CONSTANTS.domains,
            allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent'],
            allowCredentials: true,
          })
          
    }
}