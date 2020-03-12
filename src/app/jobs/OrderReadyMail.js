import Mail from '../../lib/Mail';

class OrderReadyMail {
  get key() {
    return 'OrderReadyMail';
  }

  async handle({ data }) {
    const { orderDetails } = data;

    await Mail.sendMail({
      to: `${orderDetails.partner.name} <${orderDetails.partner.email}>`,
      subject: 'A new order is ready to ship',
      template: 'orderReady',
      context: {
        partner: orderDetails.partner.name,
        recipient: orderDetails.recipient.name,
        street: orderDetails.recipient.street,
        number: orderDetails.recipient.number,
        complement: orderDetails.recipient.complement,
        zip: orderDetails.recipient.zip,
        city: orderDetails.recipient.city,
        state: orderDetails.recipient.state,
      },
    });
  }
}

export default new OrderReadyMail();
