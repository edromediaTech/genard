import { role} from '~/role'
export  default function admin({redirect, res, req,next}){
    const userl = localStorage.getItem('user_level')
    if (!localStorage.getItem('authToken')) {
        alert('Vous devez vous connecter')        
        next({ name: 'login' })
    } else if (parseInt(userl) < role.admin) {
        alert('Vous devez êtes admin')
            
             next({ name: 'index' })
                } else {
            // next()
    }
}