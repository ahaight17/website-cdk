import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { S3 } from "@aws-sdk/client-s3";

const S3_CONSTANTS = {
	bucketName: "alexhaight-website",
	bucketArn: "arn:aws:s3:::alexhaight-website"
};

const s3 = new S3();

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
	console.log(`Event: ${JSON.stringify(event, null, 2)}`);
	console.log(`Context: ${JSON.stringify(context, null, 2)}`);

	const data = await s3.listObjectsV2({ Bucket: S3_CONSTANTS.bucketName });
	
	return {
		statusCode: 200,
		body: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers":
			"Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent",
			"Access-Control-Allow-Credentials": "true",
			"Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE",
		},
	};
};