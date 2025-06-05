import { APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

const S3_CONSTANTS = {
	bucketName: "alexhaight-website-images",
	cdnUrl: "https://cdn.alexhaight.com"
};

const s3 = new S3Client();
const MAX_FETCH_KEYS = 1000;

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
	const allowedOrigins = [
		"https://alexhaight.com",
		"https://www.alexhaight.com"
	];

	const origin = event.headers.origin!;

	const corsHeaders = {
		"Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "",
		"Access-Control-Allow-Methods": "GET,OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Allow-Credentials": "true"
	};
	if (event.httpMethod === "OPTIONS") {
		return {
			statusCode: 200,
			headers: corsHeaders,
			body: "",
		};
	}

	try {
		const folder = event.queryStringParameters?.folder;
		const limit = parseInt(event.queryStringParameters?.limit || "20");
		const continuationToken = event.queryStringParameters?.token;

		if (!folder) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Missing 'folder' query param" }),
			};
		}

		const prefix = folder.endsWith("/") ? folder : `${folder}/`;

		const allKeys: string[] = [];
		let nextToken: string | undefined = undefined;

		do {
			const listCommand: ListObjectsV2Command = new ListObjectsV2Command({
				Bucket: S3_CONSTANTS.bucketName,
				Prefix: prefix,
				ContinuationToken: nextToken,
			});
			const listResult = await s3.send(listCommand);

			const keys = listResult.Contents?.map(obj => obj.Key!).filter(Boolean) ?? [];
			allKeys.push(...keys);

			nextToken = listResult.IsTruncated ? listResult.NextContinuationToken : undefined;
		} while (nextToken && allKeys.length < MAX_FETCH_KEYS);

		allKeys.sort((a, b) => {
			const nameA = a.split("/").pop()!;
			const nameB = b.split("/").pop()!;
			return nameA.localeCompare(nameB);
		});

		const offset = continuationToken ? parseInt(continuationToken, 10) : 0;
		const pagedKeys = allKeys.slice(offset, offset + limit);
		const newNextToken = offset + limit < allKeys.length ? String(offset + limit) : null;

		const cdnUrls = pagedKeys.map(key => ({
			key,
			url: `${S3_CONSTANTS.cdnUrl}/${encodeURIComponent(key).replace(/%2F/g, "/")}`
		}));

		return {
			statusCode: 200,
			body: JSON.stringify({
				items: cdnUrls,
				nextToken: newNextToken,
			}),
			headers: corsHeaders,
		};
	} catch (error) {
		console.error("Error generating image list:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Internal server error" }),
			headers: corsHeaders,
		};
	}
};