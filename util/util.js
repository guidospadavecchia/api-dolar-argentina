const config = require('../package.json');
const moment = require('moment-timezone');
const timezone = 'America/Argentina/Buenos_Aires';

class util {

    /**
     * Obtiene la página de inicio de la aplicación.
     * @returns Una respusta con el contenido de la página de inicio.
     */
    getHome = async (_req, res) => {
        try {
            res.send(`
                <head>
                    <title>DolarBot API - v${config.version}</title>
                <head>
                <body>
                    <a href=\"${config.gitRepo}\">DolarBot API</a> - v<b>${config.version}</b>
                </body>
            `)
        } catch(e) {
            console.log(e)
            res.sendStatus(500);
        }
    }

    /**
     * Configura los encabezados CORS para las respuestas HTTP.
     */
    setCorsHeaders = (_req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*")
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
        res.header('Access-Control-Allow-Headers', 'Content-Type')
        next();
    }

    /**
     * Obtiene la fecha y hora actual formateada.
     */
    getDateTime = () => moment().tz(timezone).format('yyyy/MM/DD HH:mm:ss');    

    /**
     * Formatea un texto numérico a formato moneda.
     * @param {string} value Texto que contiene el valor numérico a convertir.
     * @param {number} decimalPlaces Cantidad de caracteres decimales a conservar.
     */
    formatCurrency = (value, decimalPlaces) => {
        let decimals = decimalPlaces || 2;
        let convertedValue = parseFloat(value.includes(',') ? value.replace('.', '').replace(',', '.') : value);
        if(!isNaN(convertedValue)){
            if(convertedValue < 0.01) {
                convertedValue = Math.ceil(convertedValue * 100) / 100;
            }
            return convertedValue.toFixed(decimals);
        }
        else{
            return '?';
        }
    }

    /**
     * Formatea un texto que representa un monto a formato moneda y aplica los impuestos configurados.
     * @param {string} value Texto que contiene el valor numérico a convertir.
     * @param {number} decimalPlaces Cantidad de caracteres decimales a conservar.
     */
    formatCurrencyWithTaxes = (value, decimalPlaces) => {
        const taxPercent = parseInt(config.taxPercent);
        let decimals = decimalPlaces || 2;
        let convertedValue = parseFloat(value.includes(',') ? value.replace('.', '').replace(',', '.') : value);
        if(!isNaN(convertedValue)){
            if(convertedValue < 0.01) {
                convertedValue = Math.ceil(convertedValue * 100) / 100;
            }
            return (convertedValue * (1 + (taxPercent / 100))).toFixed(decimals);
        }
        else{
            return '?';
        }
    }

    /**
     * Devuelve un objeto que contiene los valores de la cotización anual por mes.
     * @param {object} evolucionAnual Objeto que contiene el valor de cada mes del año.
     */
    getEvolucion = (evolucionAnual) => {
        const now = new Date()
        const mesActual = now.getMonth() + 1

        let meses = []
        for (let i = 1; i <= Object.keys(evolucionAnual).length; i++) {
            meses.push({
                "anio": (i < mesActual ? now.getFullYear() : now.getFullYear() - 1).toString(),
                "mes": i.toString(),
                "valor": this.formatCurrency(evolucionAnual[[Object.keys(evolucionAnual)[i - 1]]]._text).toString()
            })
        }
        meses = meses.sort((a, b) => a.anio - b.anio)

        const valores = {
            fecha: this.getDateTime(),
            meses,
        }

        return valores;
    }

    /**
     * Devuelve un objeto que contiene los valores de la cotización anual por mes con impuestos aplicados.
     * @param {object} evolucionAnual Objeto que contiene el valor de cada mes del año.
     */
    getEvolucionWithTaxes = (evolucionAnual) => {
        const now = new Date()
        const mesActual = now.getMonth() + 1

        let meses = []
        for (let i = 1; i <= Object.keys(evolucionAnual).length; i++) {
            meses.push({
                "anio": (i < mesActual ? now.getFullYear() : now.getFullYear() - 1).toString(),
                "mes": i.toString(),
                "valor": this.formatCurrencyWithTaxes(evolucionAnual[[Object.keys(evolucionAnual)[i - 1]]]._text).toString()
            })
        }
        meses = meses.sort((a, b) => a.anio - b.anio)

        const valores = {
            fecha: this.getDateTime(),
            meses,
        }

        return valores;
    }
}

module.exports = util