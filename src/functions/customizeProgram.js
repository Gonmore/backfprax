import { Goal, Level } from "../constants/index.js"

function customizeProgram(preference,metric){
    try{
        
        if (preference.injury==true){
            switch (preference.injury_level){
                case Level.MINOR_INJURY:
                    console.log("agregar parametros de lesion menor")
                    break
                case Level.MODERATE_INJURY:
                    console.log("agregar parametros de lesion media")
                    break
                case Level.SERIOUS_INJURY:
                    console.log("agregar parametros de lesion grave")
                    break
            }
            switch (preference.injury_type){
                case Level.MINOR_INJURY:
                    console.log("agregar parametros de lesion menor")
                    break
                case Level.MODERATE_INJURY:
                    console.log("agregar parametros de lesion media")
                    break
                case Level.SERIOUS_INJURY:
                    console.log("agregar parametros de lesion grave")
                    break
            }
            
            
        }
        if (preference.athlete==false){
            console.log("agregar dos semanas de ejercicios de adecuacion")
        }
        if (preference.training==true){
            console.log('reducir pliometria en pista y dia de estiramiento e Isometricos')
            //en este punto lo ideal es reemplazar los dias pero concientizando al atleta
            //que todo depende del tipo de entrenamiento que este teniendo en su equipo
        }
        if (preference.goal == Goal.JUMP){

        }
        
    }catch(err){
        logger.error('Error createProgram: '+err);
        res.status(500).json({message: 'Server error creating Program'})
    }

}
export default customizeProgram