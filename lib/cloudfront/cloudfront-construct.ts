import { AllowedMethods, Distribution, OriginAccessIdentity, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { CanonicalUserPrincipal, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { DNS_CONSTANTS } from "../utils/constants";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { IFunction } from "aws-cdk-lib/aws-lambda";

interface CloudfrontConstructProps {
	certificate: ICertificate,
	lambdaFunction: IFunction
}

export class CloudfrontConstruct extends Construct {
	public distribution: Distribution;

	constructor(scope: Construct, id: string, props: CloudfrontConstructProps) {
		super(scope, id);

		const { certificate, lambdaFunction } = props;
		const originAccessIdentity = new OriginAccessIdentity(this, "OriginAccessIdentity");

		const s3Bucket = new Bucket(this, "S3Bucket", {
			bucketName: "alexhaight-website",
			accessControl: BucketAccessControl.PRIVATE,
		});

		s3Bucket.addToResourcePolicy(new PolicyStatement({
			actions: ["s3:GetObject"],
			resources: [s3Bucket.arnForObjects("*")],
			principals: [new CanonicalUserPrincipal(originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
		}));
		
		s3Bucket.grantReadWrite(lambdaFunction);

		this.distribution = new Distribution(this, "CloudFrontDistribution", {
			defaultBehavior: {
				origin: new S3Origin(s3Bucket, {
					originPath: "/dist"
				}),
				allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
				viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
			},
			defaultRootObject: "index.html",
			domainNames: DNS_CONSTANTS.domains,
			certificate
		});
	}
}