import PaymentList from "../../views/Finance/Payments/PaymentList";
import PaymentDetails from "../../views/Finance/Payments/PaymentDetails";

import RefundList from "../../views/Finance/Refunds/RefundList";
import RefundDetails from "../../views/Finance/Refunds/RefundDetails";

import InvoiceList from "../../views/Finance/Invoices/InvoiceList";
import InvoiceDetails from "../../views/Finance/Invoices/InvoiceDetails";

const financeRoutes = [
    {
        path: "/owner/payments",
        element: <PaymentList />,
    },
    {
        path: "/owner/payments/:paymentId",
        element: <PaymentDetails />,
    },

    {
        path: "/owner/refunds",
        element: <RefundList />,
    },
    {
        path: "/owner/refunds/:refundId",
        element: <RefundDetails />,
    },

    {
        path: "/owner/invoices",
        element: <InvoiceList />,
    },
    {
        path: "/owner/invoices/:invoiceId",
        element: <InvoiceDetails />,
    },
];

export default financeRoutes;