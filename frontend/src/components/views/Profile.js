import { useContractKit } from "@celo-tools/use-contractkit";
import { useState, useEffect, useCallback } from "react";
import { Button, Card, Form, InputGroup, Modal, Table } from "react-bootstrap";

import { addCategory, addJoke, allCategories, allJokes, allUsers, donate, isOwner, removeJoke, updateJoke } from "../../utils/joke";

import axios from 'axios';
import { getAddressSpec, getSpec, setDislike, setLike } from "../../utils";
import { useParams } from "react-router-dom";
import { safeMint } from "../../utils/joke_nft";

const Profile = ({ address, jokeContract, jokeNftContract }) => {

    // state for modal windows
    const [showCategory, setShowCategory] = useState(false);
    const [showJoke, setShowJoke] = useState(false);

    const [isOwner_, setIsowner] = useState(false);
    
    const { performActions } = useContractKit();

    const [categoryField, SetCategoryField] = useState(null);

    const [allCategories_, setAllCategories] = useState([]);

    /// add joke modal
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [joke_title, setJokeTitle] = useState("");
    const [joke_text, setJokeText] = useState("");

    // user jokes
    const [userJokes, setUserJokes] = useState([]);

    // user likes and dislikes
    const [userStats, setUserStats] = useState({ likes: 0, dislikes: 0 });

    // address of a user from a parameters
    const { paramAddress } = useParams();

    const [activeAddress, setActiveAddress] = useState(address);

    // add a new category(only for owners)
    const addCategoryEvent = async (e) => {
        setShowCategory(false);
        e.preventDefault();

        await addCategory(jokeContract, performActions, categoryField);

        await setCategories();
    }

    const setOwner = useCallback(async () => {
        setIsowner(await isOwner(jokeContract, performActions));
    }, [jokeContract]);

    const setCategories = useCallback(async () => {
        setAllCategories(await allCategories(jokeContract))
    }, [jokeContract]);

    // set selected category on the select field
    const changeCategory = (e) => {
        setSelectedCategory(e.target.value);
    }

    // check if a joke is editing or in creating
    const [inEdit, setInedit] = useState(-1);

    const { kit } = useContractKit();

    const addJokeForm = async () => {
        if (joke_title && joke_text) {

            setShowJoke(false);

            const joke = {
                title: joke_title,
                content: joke_text,
                category_id: selectedCategory,
                user: address,
                create_timestamp: Date.now()
            };

            // add a new joke event
            if (inEdit === -1) {

                if (!((await allUsers(jokeContract)).includes(address))) {
                    await axios.get(`https://simplistic-valiant-hemisphere.glitch.me/setnft?address=${address}&name=first_joke&index=triggered&value=true`).then((v) => {
                        renderNFT();
                    });
                }

                await addJoke(jokeContract, performActions, joke);

                await allUserJokes();
            
            // update an existing joke
            } else {

                await updateJoke(jokeContract, performActions, inEdit, joke);

                await allUserJokes();

            }
        }
    }


    // fetch all user joke
    const allUserJokes = useCallback(async () => {
        const all_jokes = await allJokes(jokeContract);

        let temp = [];

        let likes = 0, dislikes = 0;

        for (let index in all_jokes) {
            if (all_jokes[index].user === activeAddress) {
                const spec = await getSpec(index);

                const addressSpec = await getAddressSpec(address);

                let address_likes = addressSpec.ratings.likes,
                    address_dislikes = addressSpec.ratings.dislikes;

                temp.push({
                    index,
                    joke: all_jokes[index],
                    spec: spec,
                    liked: address_likes ? address_likes.includes(parseInt(index)) : false,
                    disliked: address_dislikes ? address_dislikes.includes(parseInt(index)) : false
                });

                likes += spec.likes;
                dislikes += spec.dislikes;
            }
        }

        // trigger an nft if a user has +5 rating
        if (likes - dislikes >= 5) {

            await axios.get(`https://simplistic-valiant-hemisphere.glitch.me/getnft?address=${address}`).then(async (v) => {
                if (v.data.rating_five.triggered === false) {
                    await axios.get(`https://simplistic-valiant-hemisphere.glitch.me/setnft?address=${address}&name=rating_five&index=triggered&value=true`).then((v) => {
                        renderNFT();
                    });
                }
            });

        }

        setUserStats({ likes, dislikes })

        setUserJokes(temp);
    }, [jokeContract, address, activeAddress]);

    const removeJokeEvent = async (index) => {
        await removeJoke(jokeContract, performActions, index);
        allUserJokes();
    }

    const editJokeEvent = useCallback((joke) => {

        setInedit(joke.index)

        setJokeTitle(joke.joke.title);
        setJokeText(joke.joke.content);
        setSelectedCategory(joke.joke.category_id);

        setShowJoke(true);
    }, []);

    // html block of a joke
    const renderJokeBlock = (joke) => {
        const col = address === activeAddress ? "col-md-3" : "col-md-6";

        return (
            <>
                <div className="row actions">
                    <div className={col + " text-center"}>
                        <button className={(joke.liked ? "selected" : "") + " btn btn-mkn2 btn-sm like"} onClick={() => setLike(joke.index, address, allUserJokes)}>
                            <i className="fas fa-thumbs-up"></i>
                        </button>
                        <span>{joke.spec.likes}</span>
                    </div>
                    <div className={col + " text-center"}>
                        <button className={(joke.disliked ? "selected" : "") + " btn btn-mkn3 btn-sm dislike"} onClick={() => setDislike(joke.index, address, allUserJokes)}>
                            <i className="fas fa-thumbs-down"></i>
                        </button>
                        <span>{joke.spec.dislikes}</span>
                    </div>
                    {address === activeAddress &&
                        <>
                            <div className="col-md-3 text-center">
                                <button className="btn btn-mkn2 btn-sm" onClick={() =>
                                    editJokeEvent(joke)
                                }>
                                    <i className="fas fa-edit"></i>
                                </button>
                            </div>

                            <div className="col-md-3 text-center">
                                <button className="btn btn-mkn2 btn-sm" onClick={() => removeJokeEvent(joke.index)}>
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </>
                    }
                </div>
                <div className="row">
                    <span className="text-end">Category - <a href="">#{allCategories_[joke.joke.category_id]} </a></span>
                </div>
            </>
        )
    }

    // data about user's minted nfts
    const [nftData, setNftData] = useState([]);

    const renderNFT = useCallback(async () => {
        axios.get(`https://simplistic-valiant-hemisphere.glitch.me/getnft?address=${address}`).then((v) => {
            setNftData(v.data)
        });
    }, []);


    useEffect(() => {
        if (paramAddress)
            setActiveAddress(paramAddress);

        // set an owner of a contract
        setOwner();

        // set all categories for creating/updating jokes
        setCategories();

        allUserJokes();

        if (activeAddress === address)
            renderNFT();

    }, [jokeContract, joke_title]);

    // indexes for nfts, specified in the contract struct
    const nfts = {
        register: 0,
        first_joke: 1,
        rating_five: 2
    }

    // mint nft event
    const mintNFT = async (type) => {

        if (await safeMint(jokeNftContract, performActions, nfts[type])) {

            await axios.get(`https://simplistic-valiant-hemisphere.glitch.me/setnft?address=${address}&name=${type}&index=minted&value=true`).then((v) => {
                renderNFT();
            });
        }
    }

    const renderNFTButton = (obj, type) => {
        const minted = obj.minted === true;
        const triggered = obj.triggered === true;
        const disabled = minted || triggered === false ? true : false;

        const text = ((!minted && triggered) ? "Mint" : (minted ? "Minted" : "Not completed"))

        return (
            <button disabled={disabled} className="btn btn-outline-light" onClick={() => mintNFT(type)}>{text}</button>
        )
    }

    const donateEvent = async () => {
        await donate(jokeContract, performActions, activeAddress);
    }

    return (
        <>
            <div className="row profile_container">
                <div className="card col-md-6 mx-auto p-0 my-4">
                    <div className="card-body">
                        <h5 className="card-title text-center">Profile</h5>
                        <div className="card-text text-center">
                            Address: {activeAddress}
                        </div>
                    </div>
                </div>
            </div>

            {address !== activeAddress &&
                <div className="col-md-6 mx-auto p-0 text-center">
                    <button className="btn btn-dark mx-auto" onClick={() => donateEvent()}>Donate 0.01 CELO to author</button>
                </div>
            }

            {address === activeAddress &&
                <div className="row profile_container">
                    <div className="row nft_ col-md-6 mx-auto p-0 my-1">
                        <Card className="col-md-4">
                            <Card.Img variant="top" src="https://gateway.pinata.cloud/ipfs/Qmdyt3mJqFUUBzwiy2jtGFzm2fdbb2zSw7VbJLwbX7Bdae" />
                            <Card.Body>
                                <Card.Title>Registration</Card.Title>
                                <Card.Text>Receive an NFT for registration</Card.Text>
                                <div className="text-center">
                                    {nftData.register &&
                                        renderNFTButton(nftData.register, "register")
                                    }
                                </div>
                            </Card.Body>
                        </Card>

                        <Card className="col-md-4">
                            <Card.Img variant="top" src="https://gateway.pinata.cloud/ipfs/QmTyZ9EyPyHjHzw6YZPkZiT9cKS7Cz1z3KNQng2cWPn5tg" />
                            <Card.Body>
                                <Card.Title>First Joke</Card.Title>
                                <Card.Text>Receive an NFT for the first joke</Card.Text>
                                <div className="text-center">
                                    {nftData.first_joke &&
                                        renderNFTButton(nftData.first_joke, "first_joke")
                                    }
                                </div>
                            </Card.Body>
                        </Card>

                        <Card className="col-md-4">
                            <Card.Img variant="top" src="https://gateway.pinata.cloud/ipfs/QmQYaGwVdqtwuc6QpJjkz5aHv7rx6r8RG4pjDaSQXsjTsj" alt="Card image cap" />
                            <Card.Body>
                                <Card.Title>Rating +5</Card.Title>
                                <Card.Text>Receive after rating +5</Card.Text>
                                <div className="text-center">
                                    {nftData.rating_five &&
                                        renderNFTButton(nftData.rating_five, "rating_five")
                                    }
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            }

            <div className="row profile_container">
                <Card className="col-md-6 mx-auto p-0 my-4">
                    <Card.Body>
                        <Card.Title className="text-center">Statictics</Card.Title>
                        <div className="card-text text-center">
                            <Table striped variant="dark">
                                <tbody>
                                    <tr>
                                        <th>Jokes added</th>
                                        <td>{userJokes.length}</td>
                                    </tr>
                                    <tr>
                                        <th>Total likes</th>
                                        <td>{userStats.likes}</td>
                                    </tr>
                                    <tr>
                                        <th>Total dislikes</th>
                                        <td>{userStats.dislikes}</td>
                                    </tr>
                                    <tr>
                                        <th>Rating</th>
                                        <td>{userStats.likes - userStats.dislikes}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>

            </div>

            <div className="row">
                <div className="col-md-6 mx-auto p-0 buts">
                    {address === activeAddress &&
                        <>
                            <Button variant="dark" onClick={() => { setInedit(-1); setJokeTitle(""); setJokeText(""); setShowJoke(true); }}>Add a joke</Button>
                            {isOwner_ &&
                                <Button variant="dark" className="mx-2" onClick={() => setShowCategory(true)}>Add a category</Button>
                            }
                        </>
                    }
                </div>
            </div>
            {userJokes.length ?
                <>
                    <div className="row">
                        <Card className="col-md-6 mx-auto p-0 mt-4">
                            <Card.Header className="text-center">
                                <h5>{address === activeAddress ? "Your jokes" : "User's jokes"}</h5>
                            </Card.Header>

                            <Card.Body>
                                <Card.Title>{userJokes[0].joke.title}</Card.Title>
                                <Card.Text>{userJokes[0].joke.content}</Card.Text>

                                {renderJokeBlock(userJokes[0])}
                            </Card.Body>
                        </Card>
                    </div>

                    {
                        userJokes.map((v, i) => {
                            if (i !== 0) {
                                return (
                                    <span key={i}>
                                        <div className="row my-2">
                                            <div className="card col-md-6 mx-auto p-0">

                                                <div className="card-body">
                                                    <h5 className="card-title">{v.joke.title}</h5>
                                                    <p className="card-text">{v.joke.content}</p>
                                                    {renderJokeBlock(v)}
                                                </div>
                                            </div>
                                        </div>
                                    </span>)
                            }
                        })
                    }
                </>
                :
                <div className="row">
                    <Card className="col-md-6 mx-auto p-0 mt-4">
                        <Card.Header className="text-center">
                            <h5>You have no jokes</h5>
                        </Card.Header>
                    </Card>
                </div>

            }

            <Modal show={showJoke} onHide={() => setShowJoke(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>New Joke</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Title</InputGroup.Text>
                            <input type="text" className="form-control" placeholder="Joke title" defaultValue={joke_title} onChange={(e) => setJokeTitle(e.target.value)} />
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Category</InputGroup.Text>
                            <select className="form-select" value={selectedCategory} onChange={(e) => changeCategory(e)}>
                                {allCategories_.map((v, i) =>
                                    <option key={i} value={i}>{v}</option>
                                )}
                            </select>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Joke text</InputGroup.Text>
                            <textarea className="form-control" defaultValue={joke_text} placeholder="Joke full text" onChange={(e) => setJokeText(e.target.value)}
                                style={{ height: "100px" }}></textarea>
                        </InputGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => addJokeForm()} >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showCategory} onHide={() => setShowCategory(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>New category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Title</InputGroup.Text>
                            <input type="text" className="form-control" placeholder="Category title" required onChange={(e) => SetCategoryField(e.target.value)} />
                        </InputGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={(e) => addCategoryEvent(e)} >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );

};

export default Profile;