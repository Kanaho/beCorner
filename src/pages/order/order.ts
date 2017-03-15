import {Component} from '@angular/core';

import {NavController} from 'ionic-angular';

import {PayPal, PayPalPayment, PayPalConfiguration} from "ionic-native";



@Component({
    selector: 'order',
    templateUrl: 'order.html'
})

export class OrderPage {
    private username: string = "";
    private password: string = "";

    constructor(public navCtrl: NavController) {

    };

    private payPal() {
        PayPal.init({
            "PayPalEnvironmentProduction": "YOUR_PRODUCTION_CLIENT_ID",
            "PayPalEnvironmentSandbox": "YOUR_SANDBOX_CLIENT_ID"
        }).then(() => {
            // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
            PayPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
                // Only needed if you get an "Internal Service Error" after PayPal login!
                //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
            })).then(() => {
                let payment = new PayPalPayment('42.00', 'EUR', 'Panier beCorner', 'sale');
                PayPal.renderSinglePaymentUI(payment).then(() => {
                    // Successfully paid

                    // Example sandbox response
                    //
                    // {
                    //   "client": {
                    //     "environment": "sandbox",
                    //     "product_name": "PayPal iOS SDK",
                    //     "paypal_sdk_version": "2.16.0",
                    //     "platform": "iOS"
                    //   },
                    //   "response_type": "payment",
                    //   "response": {
                    //     "id": "PAY-1AB23456CD789012EF34GHIJ",
                    //     "state": "approved",
                    //     "create_time": "2016-10-03T13:33:33Z",
                    //     "intent": "sale"
                    //   }
                    // }
                }, () => {
                    // Error or render dialog closed without being successful
                });
            }, () => {
                // Error in configuration
            });
        }, () => {
            // Error in initialization, maybe PayPal isn't supported or something else
        });
    }
}