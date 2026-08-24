function getModalElement(){
    return document.querySelector(".layout .modal")
}

function getHeaderElement(){
    return getModalElement().querySelector(".header")
}

function getProgressElement(){
    return getModalElement().querySelector(".progress")
}

function getContentElement(){
    return getModalElement().querySelector(".content")
}

function getFooterElement(){
    return getModalElement().querySelector(".footer")
}

function setModalError(text = null){
    if(text){
        getProgressElement().querySelector("span.error").style.display = "flex";
        getProgressElement().querySelector("span.error").innerHTML = text;
    }
    else{
        getProgressElement().querySelector("span.error").style.display = "none";
        getProgressElement().querySelector("span.error").innerHTML = "";
    }
}

function getProgressStepElement(stepCount){
    return getProgressElement()?.querySelector(`.step-container .step[data-step-count="${stepCount}"]`) ?? null;
}

function setProgressStepIconContent(stepCount, html){
    getProgressStepElement(stepCount).querySelector(".icon").innerHTML = html;
}