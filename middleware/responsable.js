// import notifier from "~/plugins/notifier"
import { role} from '~/role'
export  default function responsable({redirect, res, req,next}){
    const userl = localStorage.getItem('userl')
    if (!localStorage.getItem('authToken')) {
      alert('Vous devez vous connecter')        
        next({ name: 'login' })
    } else if (parseInt(userl) < role.responsable) {
      alert('Vous devez êtes responsable d\'ecole')             
             next({ name: 'index' })
                } else {
            // next()
    }
}