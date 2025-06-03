import { APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { GetObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3_CONSTANTS = {
	bucketName: "alexhaight-website-images",
};

const s3 = new S3Client();
const MAX_FETCH_KEYS = 1000;

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
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

		allKeys.sort((a, b) => a.localeCompare(b));

		const offset = continuationToken ? parseInt(continuationToken, 10) : 0;
		const pagedKeys = allKeys.slice(offset, offset + limit);
		const newNextToken = offset + limit < allKeys.length ? String(offset + limit) : null;

		const signedUrls = await Promise.all(
			pagedKeys.map(async key => {
				const signedUrl = await getSignedUrl(
					s3,
					new GetObjectCommand({ Bucket: S3_CONSTANTS.bucketName, Key: key }),
					{ expiresIn: 3600 } // 1 hour expiry
				);
				return { key, url: signedUrl };
			})
		);

		return {
			statusCode: 200,
			body: JSON.stringify({
				items: signedUrls,
				nextToken: newNextToken,
			}),
		};
	} catch (error) {
		console.error("Error generating image list:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Internal server error" }),
		};
	}
};