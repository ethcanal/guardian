import { METHOD, STATUS_CODE } from "../../../support/api/api-const";
import API from "../../../support/ApiUrls";
import * as Authorization from "../../../support/authorization";

context("Schemas", { tags: ['schema', 'thirdPool', 'all'] }, () => {
    const SRUsername = Cypress.env('SRUser');
    let schema;

    before(() => {
        Authorization.getAccessToken(SRUsername).then((authorization) => {
            cy.request({
                method: METHOD.GET,
                url: API.ApiServer + API.Schemas,
                headers: {
                    authorization,
                },
            }).then((response) => {
                expect(response.status).eql(STATUS_CODE.OK);
                let schemaId = response.body[0].id;
                cy.request({
                    method: METHOD.GET,
                    url:
                        API.ApiServer +
                        API.Schemas +
                        schemaId +
                        "/export/file",
                    encoding: null,
                    headers: {
                        authorization,
                    },
                }).then((response) => {
                    expect(response.status).to.eq(STATUS_CODE.OK);
                    expect(response.body).to.not.be.oneOf([null, ""]);
                    schema = Cypress.Blob.arrayBufferToBinaryString(
                        response.body
                    );
                });
            })
        });
    });

    it("Push import new schema from a file", () => {
        Authorization.getAccessToken(SRUsername).then((authorization) => {
            cy.request({
                method: METHOD.GET,
                url: API.ApiServer + API.Schemas,
                headers: {
                    authorization,
                },
            }).then((response) => {
                const topicUid = response.body[0].topicId;
                cy.request({
                    method: METHOD.POST,
                    url:
                        API.ApiServer +
                        API.Schemas +
                        "push/" +
                        topicUid +
                        "/import/file",
                    body: schema,
                    headers: {
                        "content-type": "binary/octet-stream",
                        authorization,
                    },
                }).then((response) => {
                    expect(response.status).to.eq(STATUS_CODE.ACCEPTED);
                    expect(response.body).to.not.be.oneOf([null, ""]);
                });
            });
        });
    });
});
