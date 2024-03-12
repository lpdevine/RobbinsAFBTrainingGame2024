
import ErrorMessage from "./ErrorMessage";


    interface Props{
        formType: 'login' | 'signup',
        title: string,
        showError: boolean,
        errorMessage: string,
        formData: {email:string, password:string, firstName?:string, lastName?:string, squadron?:string},
        onSubmit: (e: React.FormEvent) => void,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    }

function EmailPasswordForm(props: Props){
    const { formType } = props;

    return <>
        {props.showError && <ErrorMessage message={props.errorMessage} />}
        <div>
            <form onSubmit={props.onSubmit}>
                <h1>{props.title}</h1>
                <label>Email: </label>
                <input 
                    type="text"
                    name="email"
                    value={props.formData["email"]}
                    onChange={props.onChange}
                    required>
                </input>
                <br></br>
                {formType === 'signup' && (
                        <>
                            <label>First Name: </label>
                            <input
                                type="text"
                                name="firstName"
                                value={props.formData["firstName"]}
                                onChange={props.onChange}
                                required
                            />
                            <br />
                            <label>Last Name: </label>
                            <input
                                type="text"
                                name="lastName"
                                value={props.formData["lastName"]}
                                onChange={props.onChange}
                                required
                            />
                            <br />
                            <label>Squadron: </label>
                            <input
                                type="text"
                                name="squadron"
                                value={props.formData["squadron"]}
                                onChange={props.onChange}
                                required
                            />
                            <br />
                        </>
                    )}
                <label>Password: </label>
                <input 
                    type="password"
                    name="password" 
                    value={props.formData["password"]} 
                    onChange={props.onChange}
                    required>
                </input>
                <br></br>
                <button type="submit">Submit</button>
            </form>
        </div>
    </>;
}

export default EmailPasswordForm;