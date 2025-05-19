import { AllowedMethods, Distribution, OriginAccessIdentity, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { DNS_CONSTANTS } from "../utils/constants";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Duration } from "aws-cdk-lib";

interface WebsiteCloudfrontProps {
	certificate: ICertificate,
	lambdaFunction: IFunction
}

export class WebsiteCloudfront extends Construct {
	public websiteDistribution: Distribution;

	constructor(scope: Construct, id: string, props: WebsiteCloudfrontProps) {
		super(scope, id);

		const { certificate, lambdaFunction } = props;
		const originAccessIdentity = new OriginAccessIdentity(this, "OriginAccessIdentity");

		const webisteAssetsBucket = new Bucket(this, "WebsiteAssetsBucket", {
			bucketName: "alexhaight-website",
			accessControl: BucketAccessControl.PRIVATE,
		});

		this.websiteDistribution = new Distribution(this, "WebsiteCloudFrontDistribution", {
			defaultBehavior: {
				origin: new S3Origin(webisteAssetsBucket, {
					originPath: "/dist",
					originAccessIdentity
				}),
				allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
				viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
			},
			defaultRootObject: "index.html",
			domainNames: DNS_CONSTANTS.websiteDomains,
			certificate,
			errorResponses: [
				{
					httpStatus: 403,
					responseHttpStatus: 200,
					responsePagePath: "/index.html",
					ttl: Duration.minutes(0),
				},
				{
					httpStatus: 404,
					responseHttpStatus: 200,
					responsePagePath: "/index.html",
					ttl: Duration.minutes(0),
				},
			],
		});

		webisteAssetsBucket.grantRead(originAccessIdentity);
		webisteAssetsBucket.grantReadWrite(lambdaFunction);
	}
}