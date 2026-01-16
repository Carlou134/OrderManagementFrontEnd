import axios from 'axios';

const ApiUrl = "https://localhost:7197/api";

//Orders

export const getOrders = async() => {
    try{
        const response = await axios.get(`${ApiUrl}/orders/list`);
        return response.data;
    }
    catch(e){
        console.error("Error: ", e);
        throw e;
    }
}

export const createOrder = async (order) => {
    try{
        const response = await axios.post(`${ApiUrl}/orders/create`, order);
        return response.data;
    }
    catch(error){
        console.error("Error: ", error);
        throw error;
    }
}

export const updateOrder = async(id, order) => {
    try{
        const response = await axios.update(`${ApiUrl}/orders/update/${id}`, order);
        return response.data;
    }
    catch(error){
        console.error("Error: ", error);
        throw error;
    }
}

export const deleteOrder = async(id) => {
    try{
        const response = await axios.delete(`${ApiUrl}/orders/delete/${id}`);
        return response.data;
    }
    catch(error){
        console.error("Error: ", error);
        throw error;
    }
}

export const listOrderById = async(id) => {
    try{
        const response = await axios.get(`${ApiUrl}/orders/list/${id}`);
        return response.data;
    }
    catch(error){
        console.error("Error: ", error);
        throw error;
    }
}

export const ChangeOrderStatus = async(status, id) => {
    try{
        const response = await axios.post(`${ApiUrl}/orders/changestatus/${id}`, status);
        return response.data;
    }
    catch(error){
        console.error("Error: ", error);
        throw error;
    }
}

//Products

export const getProducts = async() => {
    try{
        const response = await axios.get(`${ApiUrl}/products/list`);
        return response.data;
    }
    catch(e){
        console.error("Error: ", e);
        throw e;
    }
}

export const createProduct = async (product) => {
    try{
        const response = await axios.post(`${ApiUrl}/products/create`, product);
        return response.data;
    }
    catch(error){
        console.error("Error: ", error);
        throw error;
    }
}

export const updateProduct = async(id, product) => {
    try{
        const response = await axios.update(`${ApiUrl}/products/update/${id}`, product);
        return response.data;
    }
    catch(error){
        console.error("Error: ", error);
        throw error;
    }
}

export const deleteProduct = async(id) => {
    try{
        const response = await axios.delete(`${ApiUrl}/products/delete/${id}`);
        return response.data;
    }
    catch(error){
        console.error("Error: ", error);
        throw error;
    }
}

export const listProductById = async(id) => {
    try{
        const response = await axios.get(`${ApiUrl}/products/list/${id}`);
        return response.data;
    }
    catch(error){
        console.error("Error: ", error);
        throw error;
    }
}
