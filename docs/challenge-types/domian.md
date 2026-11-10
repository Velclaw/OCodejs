---
title: Why is my Vercel domain not verified?
description: Information on why a Vercel domain may not be verified and how to verify it.
url: "https://vercel.com/kb/guide/why-is-my-vercel-domain-unverified"
published: 2025-11-03
last_updated: 2026-09-23
authors: Matthew Sweeney, Sam Ko, Justin Vitale
install_vercel_plugin: npx plugins add vercel/vercel-plugin
---

**Try Jev on Vercel AI Gateway**

Give your application a faster way to decide what should happen next. Use Jev to route requests, flag content, and score priorities.

[Get started](https://vercel.com/kb/jev-from-typesafe-ai)

When adding a [custom domain](https://vercel.com/docs/v2/custom-domains) to Vercel, it must go through a process of verification. This process involves changing DNS records.

Once DNS records have been changed, they can take a while to propagate, which means global DNS providers recognise they have been changed. A custom domain added to Vercel will appear as unverified until this process is complete and full propagation has been achieved.

## Domain is verified but can't access the website

If you have recently changed DNS records, you're not able to see your website and the Vercel Dashboard shows that the domain is configured correctly then it's likely that you have a cached DNS record on your local device or network.

You can test this by using a different device on a different internet connection (a smartphone using mobile data usually works best).

This cache is cleared automatically after a certain period of time (usually anywhere from 1-24 hours), however it can be manually cleared by restarting your local computer or your local firewall/router. You can also clear this via your operating system's commands, however this varies for each device/operating system and would recommend researching how to do this for your specific device.

## Nameserver Changes

If you have changed the nameservers with your current domain registrar then it usually takes up to 48 hours for these to be reflected globally. This is not something that Vercel has any control over and for certain registrars, this can be slower.

Once nameservers have been changed, you may wish to check the progress of the propagation. There are many third-party tools that do this, such as [DNS Checker](https://dnschecker.org/) and [DNS Map](https://dnsmap.io/) - these show the state of your DNS records in different regions of the world.

You can also use the terminal to check the nameservers for your domain using specific DNS providers, some examples are found below:

```bash
dig @8.8.8.8 +short NS vercel.com
```
```bash
dig @1.1.1.1 +short NS vercel.com
```
```bash
dig @ns1.vercel-dns.com +short NS vercel.com
```

## CNAME Record Changes

Unlike nameserver changes, propagation of CNAME records are usually very quick to propagate.

You can check the propagation progress of CNAME records for your domain with third-party tools like [DNS Checker](https://dnschecker.org/) and [DNS Map](https://dnsmap.io/) in the same way you can for nameservers.

You can also use the terminal to check the CNAME record for your domain using specific DNS providers, some examples are found below:

```bash
dig @8.8.8.8 +short CNAME www.vercel.com
```
```bash
dig @1.1.1.1 +short CNAME www.vercel.com
```
```bash
dig @ns1.vercel-dns.com +short CNAME www.vercel.com
```

## A Record Changes

In the same way as CNAME records, A records usually propagate very quickly.

You can check the propagation progress of A records for your domain with third-party tools like [DNS Checker](https://dnschecker.org/) and [DNS Map](https://dnsmap.io/) in the same way you can for CNAME.

You can also use the terminal to check the A record for your domain using specific DNS providers, some examples are found below:

```bash
dig @8.8.8.8 +short A vercel.com
```
```bash
dig @1.1.1.1 +short A vercel.com
```
```bash
dig @ns1.vercel-dns.com +short A vercel.com
```