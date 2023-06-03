export const isOwner = async (jokeContract) => {
    var isOwner = false;
    try {
        isOwner = await jokeContract.methods.isOwner().call();;
    } catch (e) {
        console.log({ e });
    }

    return isOwner;
};

export const addCategory = async (jokeContract, performActions, title) => {
    try {
        await performActions(async (kit) => {
            const { defaultAccount } = kit;

            await jokeContract.methods.addCategory(title).send({ from: defaultAccount });
        });

        return true;
    } catch (e) {
        console.log({ e });
    }
};

export const removeJoke = async (jokeContract, performActions, index) => {
    try {
        await performActions(async (kit) => {
            const { defaultAccount } = kit;

            await jokeContract.methods.removeJoke(index).send({ from: defaultAccount });
        });

        return true;
    } catch (e) {
        console.log({ e });
    }
};

export const allCategories = async (jokeContract) => {
    var categories = [];
    try {
        categories = await jokeContract.methods.allCategories().call();;
    } catch (e) {
        console.log({ e });
    }

    return categories;
};

export const allUsers = async (jokeContract) => {
    var users = [];
    try {
        users = await jokeContract.methods.allUsers().call();;
    } catch (e) {
        console.log({ e });
    }

    return users;
};


export const allJokes = async (jokeContract) => {
    var jokes = [];
    try {
        jokes = await jokeContract.methods.allJokes().call();;
    } catch (e) {
        console.log({ e });
    }

    return jokes;
};

export const addJoke = async (jokeContract, performActions, obj) => {
    try {
        await performActions(async (kit) => {
            const { defaultAccount } = kit;

            await jokeContract.methods.addJoke(obj).send({ from: defaultAccount });
        });

        return true;
    } catch (e) {
        console.log({ e });

        return e;
    }
};

export const updateJoke = async (jokeContract, performActions, index, obj) => {
    try {
        await performActions(async (kit) => {
            const { defaultAccount } = kit;

            await jokeContract.methods.updateJoke(index, obj).send({ from: defaultAccount });
        });

        return true;
    } catch (e) {
        console.log({ e });

        return e;
    }
};

export const donate = async (jokeContract, performActions, destination) => {

    const v =  0.1 * Math.pow(10, 18);

    try {
        await performActions(async (kit) => {
            const { defaultAccount } = kit;

            await jokeContract.methods.donate(destination).send({ from: defaultAccount, value: v });
        });

        return true;
    } catch (e) {
        console.log({ e });

        return e;
    }
};