import { Certificate, ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone, IHostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { DNS_CONSTANTS } from "../utils/constants";

export class DnsConstruct extends Construct {
    public zone: IHostedZone;
    public certificate: ICertificate

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.certificate = Certificate.fromCertificateArn(
			this,
			"WebsiteCertificate",
			DNS_CONSTANTS.certificateArn
		);

		this.zone = HostedZone.fromHostedZoneAttributes(this, "WebsiteHostedZone", {
			hostedZoneId: DNS_CONSTANTS.hostedZoneId,
			zoneName: DNS_CONSTANTS.zoneName
		});
    }
}