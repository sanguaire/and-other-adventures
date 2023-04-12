export class AoaTokenDocument extends TokenDocument
{
    _onUpdateTokenActor(data, options, userId) {
        return super._onUpdateTokenActor(data, options, userId);
    }

    _onUpdateBaseActor(update = {}, options = {}) {
        super._onUpdateBaseActor(update, options);
    }

    async modifyActorDocument(update, options) {
        return super.modifyActorDocument(update, options);
    }

    async updateActorEmbeddedDocuments(embeddedName, updates, options) {
        return super.updateActorEmbeddedDocuments(embeddedName, updates, options);
    }

}
