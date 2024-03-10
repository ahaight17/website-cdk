import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
	console.log(`Event: ${JSON.stringify(event, null, 2)}`);
	console.log(`Context: ${JSON.stringify(context, null, 2)}`);
	return {
		statusCode: 200,
		body: JSON.stringify({
			message: "hello world",
		}),
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers':
			'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
			'Access-Control-Allow-Credentials': 'true',
			'Access-Control-Allow-Methods': 'OPTIONS,GET,PUT,POST,DELETE',
		  },
	};
};