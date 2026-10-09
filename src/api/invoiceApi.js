import api from "./axios";

const invoiceApi = {

    // ============================================================
    // GET LIBRARY INVOICES
    // ============================================================

    getLibraryInvoices: async (libraryId) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/invoices`
            );

        return response.data;
    },


    // ============================================================
    // GET INVOICE DETAILS
    // ============================================================

    getInvoiceById: async (
        libraryId,
        invoiceId
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/invoices/${invoiceId}`
            );

        return response.data;
    },


    // ============================================================
    // DOWNLOAD INVOICE PDF
    // ============================================================

    downloadInvoice: async (
        libraryId,
        invoiceId,
        invoiceNumber
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/invoices/${invoiceId}/download`,
                {
                    responseType:
                        "blob",
                }
            );


        const blob =
            new Blob(
                [response.data],
                {
                    type:
                        "application/pdf",
                }
            );


        const url =
            window.URL
                .createObjectURL(
                    blob
                );


        const link =
            document
                .createElement(
                    "a"
                );


        link.href =
            url;


        link.download =
            invoiceNumber
                ? `${invoiceNumber}.pdf`
                : `invoice-${invoiceId}.pdf`;


        document.body
            .appendChild(
                link
            );


        link.click();


        link.remove();


        window.URL
            .revokeObjectURL(
                url
            );
    },
};

export default invoiceApi;