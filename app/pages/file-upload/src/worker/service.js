export default class Service {
    #url;

    constructor({ url }) {
        this.#url = url;
    }

    async uploadFile({ filename, buffer }) {
        const formData = new FormData();
        formData.append(filename, buffer);

        const response = await fetch(this.#url, {
            method: "POST",
            body: formData
        });

        console.assert(response.ok, "Response is not ok", response);
        return response;
    }
}
