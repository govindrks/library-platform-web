import api from "./axios";


const automationApi = {


    // =========================================================
    // GET RULES
    // =========================================================

    getRules: async (
        libraryId
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/automations`
            );

        return response.data;
    },


    // =========================================================
    // SUMMARY
    // =========================================================

    getSummary: async (
        libraryId
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/automations/summary`
            );

        return response.data;
    },


    // =========================================================
    // CREATE RULE
    // =========================================================

    createRule: async (
        libraryId,
        payload
    ) => {

        const response =
            await api.post(
                `/api/libraries/${libraryId}/automations`,
                payload
            );

        return response.data;
    },


    // =========================================================
    // UPDATE RULE
    // =========================================================

    updateRule: async (
        libraryId,
        ruleId,
        payload
    ) => {

        const response =
            await api.put(
                `/api/libraries/${libraryId}/automations/${ruleId}`,
                payload
            );

        return response.data;
    },


    // =========================================================
    // ENABLE
    // =========================================================

    enableRule: async (
        libraryId,
        ruleId
    ) => {

        const response =
            await api.put(
                `/api/libraries/${libraryId}/automations/${ruleId}/enable`
            );

        return response.data;
    },


    // =========================================================
    // DISABLE
    // =========================================================

    disableRule: async (
        libraryId,
        ruleId
    ) => {

        const response =
            await api.put(
                `/api/libraries/${libraryId}/automations/${ruleId}/disable`
            );

        return response.data;
    },


    // =========================================================
    // GENERIC ENABLE / DISABLE TOGGLE
    // =========================================================

    toggleRule: async (
        libraryId,
        ruleId,
        enabled
    ) => {

        const response =
            await api.patch(
                `/api/libraries/${libraryId}/automations/${ruleId}/enabled`,
                null,
                {
                    params: {
                        enabled,
                    },
                }
            );

        return response.data;
    },


    // =========================================================
    // DELETE CUSTOM RULE
    // =========================================================

    deleteRule: async (
        libraryId,
        ruleId
    ) => {

        await api.delete(
            `/api/libraries/${libraryId}/automations/${ruleId}`
        );
    },


    // =========================================================
    // EXECUTION HISTORY
    // =========================================================

    getExecutions: async (
        libraryId
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/automations/executions`
            );

        return response.data;
    },


    getRuleExecutions: async (
        libraryId,
        ruleId
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/automations/${ruleId}/executions`
            );

        return response.data;
    },


    // =========================================================
    // EXECUTION DETAIL
    // =========================================================

    getExecution: async (
        libraryId,
        executionId
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/automations/executions/${executionId}`
            );

        return response.data;
    },


    // =========================================================
    // GENERATED REPORTS
    // =========================================================

    getGeneratedReports: async (
        libraryId
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/automations/reports`
            );

        return response.data;
    },


    // =========================================================
    // DOWNLOAD GENERATED REPORT
    // =========================================================

    downloadGeneratedReport: async (
        libraryId,
        reportId,
        fileName
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/automations/reports/${reportId}/download`,
                {
                    responseType:
                        "blob",
                }
            );


        const blob =
            new Blob(
                [
                    response.data,
                ],
                {
                    type:
                        response.headers[
                            "content-type"
                        ] ||
                        "application/octet-stream",
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
            fileName ||
            "automation-report";


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


export default automationApi;