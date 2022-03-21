import React, {Component} from "react";
import './Style.css';
import {queryByResults} from "../firebase/firestore";
import {Card, CardContent, Grid, Typography} from "@mui/material";

class FileList extends Component {
    state = {
        //Calculates the wordle round based on the amount of days since the 17th of february, when i first created this
        wordle: 269 + (((new Date(new Date().toLocaleDateString()).getTime()) - (new Date("3/15/2022")).getTime()) / (1000 * 3600 * 24)),
        files: []
    };

    //Downloads current results of us when page first loads
    componentDidMount() {
        this.findResults(this.state.wordle)
    }

    //Downloads from firebase
    findResults(wordleID) {
        console.log(wordleID)
        let wordleResults = [];

        //Makes a query to firebase using a function defined elsewhere
        queryByResults(wordleID).then((result) => {
            //If result exists
            if (result !== undefined && result.length !== 0) {
                //For each resulting doc that downloads
                result.forEach((doc) => {
                    //Extract data from doc
                    doc = doc.data();
                    //And create a card for each doc
                    wordleResults.push(this.resultCard(doc));
                });

                //Once loop finishes, save list to state
                this.setState({results: wordleResults});
            }
            //Catch firestore errors
        }).catch((error) => {
            console.log(error);
        });
    }

    //A lot of bullshit that creates the card format
    resultCard(doc) {
        return (
            <Grid item key={doc['user'] + doc['submissionTime']}>
                <Card sx={{width: 400}}>
                    <CardContent className={'FileCard'}>
                        <Grid container>
                            <Grid item xs={6}>
                                <Typography sx={{fontSize: 20}} color={"text.primary"} gutterBottom>
                                    {doc['guess']}/6: {doc['user']}
                                </Typography>
                                <Typography variant={"h6"} component={"div"}>
                                    {doc['message']}
                                </Typography>
                                <Typography variant={'body2'}>
                                    {new Date(doc['submissionTime']).toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography sx={{fontSize: 15}} color={'text.secondary'}
                                            style={{whiteSpace: 'pre-line'}}>
                                    {doc['result']}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        );
    }

    render() {
        return (
            <div className={'FileList'}>
                <Typography variant={'h4'}>
                    Results for Wordle: {this.state.wordle}
                </Typography>
                <br/>
                <Grid container spacing={1} direction={"column"} alignItems={"center"} justify={"center"}>
                    {this.state.results}
                </Grid>
            </div>
        );
    }
}

export default FileList