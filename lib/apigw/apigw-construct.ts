import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface ApiGatewayConstructProps {
    lambdaFunction: IFunction
}

export class ApiGatewayConstruct extends Construct {
    constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
        super(scope, id);

        const { lambdaFunction } = props

        const api = new RestApi(this, "LambdaRestApi", {
            restApiName: "LambdaRestAPI",
            description: "Serves objects from S3"
        })

        const fetchS3 = new LambdaIntegration(lambdaFunction)

        api.root.addMethod("GET", fetchS3)

        api.root.addCorsPreflight({
            allowOrigins: ['*'],
            allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent'],
            allowCredentials: true,
          })
          
    }
}