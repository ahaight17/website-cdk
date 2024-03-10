#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { App } from "./stack-builder";

const app = new cdk.App();
new App(app, "WebsiteCdkStack", {
	terminationProtection: true,
	env: { 
		account: "587813431606",
		region: "us-east-1" 
	},
});