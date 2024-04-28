# Natours Application

## General Information

- Developer: Jaxon Zhang
- Start building at January 2024
- Finished at April 2024
- [Live Demo Here](https://natours.zhang-yang.com/)

## Description

This is a complete web development project that is built using modern technologies, including **_Node.js, express, MongoDB_**, and more. This project is for demonstration only and may be modified for personal preference in future, **but will NEVER be released in production**.

The project is for **LEARNING PURPOSE** only and is built by following steps along with an online course, taught by _Jonas Schemedtmann_ on [Udemy](https://www.udemy.com/). My future plan is to keep learning more techonologies, specially React, HTML, and CSS.

## How to Use?

The config.env file is not uploaded to protect sensitive data. To deploy the application on your own system, you have to create a new config files and set the following environment variables. A link to the web that is run on a personal server is attached for demonstration.

[https://natours.zhang-yang.com/](https://natours.zhang-yang.com/)

>[!TIPS]
>
> Use the following account and password to log in
>
> email: admin@gmail.com
>
> password: pass1234


#### Example of the config.env
```
NODE_ENV=development
PORT=3000
DATABASE=Link to Connect Your MongoDB
DATABASE_PASSWORD=Your Data Base Password

JWT_SECRET=a-secret-key-used-to-hash-your-token
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_USERNAME=MailtrapUserName
EMAIL_PASSWORD=MailtrapPassword
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=MailtrapHost
EMAIL_FROM=YourEmail@gmail.com

STRIPE_SECRET_KEY=YourStripeSecretKey
```


> **NODE_ENV** 
> 
> It can be either 'development' or 'production'. Under development mode, the Error message returned will include more details.

> **JWT_***
>
> [JWT](https://dashboard.stripe.com/) is used for user authentication purpose.

> **EMAIL_***
>
> The arguments started with EMAIL_ are used to set up [Mailtrap](https://mailtrap.io/), which prevents the email being sent to the real user address during development.

> **STRIPE_SECRET_KEY**
>
> [Stripe](https://dashboard.stripe.com/) is used to set up the payment. In the web application, Stripe is under test mode. No real payment is processed. 

## Submission Log

- [April 28, 2024] Submmited for UCSB Capstone Application

## Modification History

- Created at April 27, 2024
- Modified at April 27, 2024
  - Reformat using .readme syntax for better demonstration purpose.
  - Add the link to the web page run on the personal server.
- Modified at April 28, 2024
  - Deployment and fix some bugs
