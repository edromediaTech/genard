// import notifier from "~/plugins/notifier"
import { role} from '~/role'
export  default function operateur({redirect, res, req,next}){
    const userl = localStorage.getItem('user_level')
    if (!localStorage.getItem('authToken')) {
      alert('Vous devez vous connecter')        
        next({ name: 'login' })
    } else if (parseInt(userl) < role.operateur) {
      alert('Vous devez êtes Operateur')             
             next({ name: 'index' })
                } else {
            // next()
    }
}