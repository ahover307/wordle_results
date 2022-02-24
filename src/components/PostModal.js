import React, {Component} from "react";
import './Style.css';
import {uploadResults} from "../firebase/firestore";

//File docs: https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications
//React docs simple forms: https://reactjs.org/docs/forms.html
//Blank space: https://stackoverflow.com/questions/40264084/best-practice-when-adding-whitespace-in-jsx

class PostModal extends Component {
    state = {
        status: 0,
        isOpen: true,
    }

    //Bind function across sessions
    constructor(e) {
        super(e);
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit(e) {
        e.preventDefault();
        //If result is empty, do not continue
        if (e.target['result'].value === '') {
            alert("There is no items to upload");
        } else {
            //Extract all numbers from result down into an array
            let result = e.target['result'].value
            let wordle = result.match(/^\d+|\d+\b|\d+(?=\w)/g)
            //Expected results from extracted numbers
            // ['wordle round', 'guess amount', 'total guesses (always 6)']
            // [247, 4, 6]
            if (wordle !== null && wordle !== undefined && wordle.length === 3) {
                //Only upload if there are 3 numbers, matching our expected pattern
                uploadResults(e.target['name'].value, e.target['result'].value, e.target['message'].value, parseInt(wordle[0]), parseInt(wordle[1])).then(result => {
                    //Call parents function to close modal on the homepage
                    this.props.closeModalFunction(1);
                    window.location.reload();
                });
            } else {
                //If wordle string does not extract 3 numbers, show this error
                alert("The wordle results string is broken. make sure you pasted it right");
            }
        }
    }

    render() {
        //Incredibly basic form to submit items
        return (
            <div>
                Post results here
                <br/>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Name:
                        <br/>
                        <input type={"text"} id={'name'}/>
                    </label>
                    <br/>
                    <label>Copy and paste results from wordle here
                        <br/>
                        <textarea id={'result'}/>
                    </label>
                    <br/>
                    <label>
                        Comments to post with the results?
                        <br/>
                        <input type={'text'} id={'message'}/>
                    </label>
                    <br/>
                    <br/>
                    <label>Post: <span> </span>
                        <input type={'submit'} id={'submit'} value={'Submit'}/>
                    </label>
                </form>
            </div>);
    }
}

export default PostModal;
