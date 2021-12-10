module.exports.returnAssetLinks = (Asset_Type, Pod_Number) => {
    let API_ID_Asset_Type, API_Dep_Asset_Type;
    if (Asset_Type == "microsites") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/microsites?page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/microsite/'
    }
    else if (Asset_Type == "fieldmerges") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/fieldMerges?page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/fieldMerge/'
    }
    else if (Asset_Type == "contactfields") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/contact/fields?page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/contact/field/'
    }
    else if (Asset_Type == "optionlists") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/OptionLists?page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/OptionList/'
    }
    else if (Asset_Type == "emailfooters") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/email/footers?page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/email/footer/'
    }
    else if (Asset_Type == "emailheaders") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/email/headers?page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/email/header/'
    }
    else if (Asset_Type == "emailgroups") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/email/groups?page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/email/group/'
    }
    else if (Asset_Type == "contactlists") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/contact/lists?page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/contact/list/'
    }
    else if (Asset_Type == "emails") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/emails?page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/email/'
    }
    else if (Asset_Type == "emails2") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/2.0/assets/emails?&page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/email/'
    }
    else if (Asset_Type == "forms") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/forms?page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/form/'
    }
    else if (Asset_Type == "landingpages") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/landingpages?page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/1.0/assets/landingpage/'
    }
    else if (Asset_Type == "segments") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/2.0/assets/contact/segments?page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/2.0/assets/contact/segment/'
    }
    else if (Asset_Type == "programs") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/2.0/assets/programs?page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/2.0/assets/program/'
    }
    else if (Asset_Type == "campaigns") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/2.0/assets/campaigns?page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/2.0/assets/campaign/'
    }
    else if (Asset_Type == "customobjects") {
        API_ID_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/2.0/assets/customObjects?page='
        API_Dep_Asset_Type = 'https://secure.p0' + Pod_Number + '.eloqua.com/api/REST/2.0/assets/customObject/'
    }

    return {
        depLink: API_Dep_Asset_Type,
        idLink: API_ID_Asset_Type
    }
}