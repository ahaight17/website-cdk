import * as cdk from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, AaaaRecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { AllowedMethods, Distribution, OriginAccessIdentity, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { CanonicalUserPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class App extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const certificate = Certificate.fromCertificateArn(
      this,
      "WebsiteCertificate",
      "arn:aws:acm:us-east-1:587813431606:certificate/4f761958-5c50-409f-85bc-8afc83e7c626"
    )

    const zone = HostedZone.fromHostedZoneAttributes(this, "WebsiteHostedZone", {
      hostedZoneId: "Z07198023M07ZFUXXMT2M",
      zoneName: "alexhaight.com"
    })

    const originAccessIdentity = new OriginAccessIdentity(this, "OriginAccessIdentity")
        
    const s3Bucket = new Bucket(this, "S3Bucket", {
        bucketName: "alexhaight-website",
        accessControl: BucketAccessControl.PRIVATE,
    })

    s3Bucket.addToResourcePolicy(new PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [s3Bucket.arnForObjects('*')],
        principals: [new CanonicalUserPrincipal(originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
    }));

    const distribution = new Distribution(this, "CloudFrontDistribution", {
        defaultBehavior: {
            origin: new S3Origin(s3Bucket),
            allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        defaultRootObject: "dist/index.html",
        domainNames: [
            "www.alexhaight.com",
        ],
        certificate
    })
    
    new ARecord(this, "CDNARecord", {
      zone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });

    new AaaaRecord(this, "CDNAliasRecord", {
      zone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }
}
