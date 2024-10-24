// import notifier from "~/plugins/notifier"
import { role} from '~/role'
export  default function inspecteur({redirect, res, req,next}){
    const userl = localStorage.getItem('userl')
    if (!localStorage.getItem('authToken')) {
      alert('Vous devez vous connecter')        
        next({ name: 'login' })
    } else if (parseInt(userl) < role.inspecteurZ) {
      alert('Vous devez êtes inspecteur')             
             next({ name: 'index' })
                } else {
            // next()
    }
}