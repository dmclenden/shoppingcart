import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart";
import CircularProgress from "@material-ui/core/CircularProgress";
import { addItemInCart } from "../../Redux/Actions";
import Api from "../../Api";
import Item from "../Item/Item";
import { connect } from "react-redux";
import TextField from "@material-ui/core/TextField";



class ConnectedDetails extends Component {
  constructor(props) {
    super(props);

    this.isCompMounted = false;

    this.state = {
      relatedItems: [],
      quantity: 1,
      item: null,
      loading: false
    };
  }

  // Gets product and its related items based on product ID.
  async fetchProductUsingID(id) {
    this.setState({ loading: true });

    let item = await Api.getItemUsingID(id);

    let relatedItems = await Api.searchItems({
      category: item.category,
    });

    // Make sure this component is still mounted before we set state..
    if (this.isCompMounted) {
      this.setState({
        item,
        quantity:1,
        relatedItems: relatedItems.data.filter(x => x.id !== item.id),
        loading: false,
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    
    // If ID of product changed in URL, refetch details for that product
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.fetchProductUsingID(this.props.match.params.id);
    }
    
  }


  componentDidMount() {
    this.isCompMounted = true;
    this.fetchProductUsingID(this.props.match.params.id);
  }

  componentWillUnmount() {
    this.isCompMounted = false;
  }



  render() {
    if (this.state.loading) {
      return <CircularProgress className="circular" />;
    }

    if (!this.state.item) {
      return null;
    }
    return (
      <div style={{ padding: 10 }}>
        <div
          style={{
            marginBottom: 20,
            marginTop: 10,
            color: "gray",
            fontSize: 20
          }}
        >
          {this.state.item.name}
        </div>
        <div style={{ display: "flex" }}>
          <img src={this.state.item.imageUrls[0]} alt="" width={250} height={250} style={{ borderRadius: "5%", objectFit: "cover" }} />
          <div
            style={{
              flex: 1,
              marginLeft: 20,
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div style={{ fontSize: 18, marginTop: 10 }}>
              Price: {this.state.item.price} $
            </div>
            {this.state.item.popular && (
              <span style={{ marginTop: 5, fontSize: 14, color: "#228B22" }}>
                (Popular product)
              </span>
            )}

            <TextField
              type="number"
              value={this.state.quantity}
              style={{ marginTop: 20, marginBottom: 20, width: 50 }}
              label="Quantity"
              inputProps={{ min: 1, max: 10, step: 1 }}
              onChange={e => {
                this.setState({ quantity: parseInt(e.target.value) });
              }}
            />
            <Button
              style={{ width: 200, marginTop: 5 }}
              color="primary"
              variant="outlined"
              onClick={() => {
                this.props.dispatch(
                  addItemInCart({
                    ...this.state.item,
                    quantity: this.state.quantity
                  })
                );
              }}
            >
              Add to Cart <AddShoppingCartIcon style={{ marginLeft: 5 }} />
            </Button>
          </div>
        </div>

        {/* Product description */}
        <div
          style={{
            marginTop: 30,
            marginBottom: 20,
            color: "gray",
            fontSize: 20
          }}
        >
          Product Description
        </div>
        <div
          style={{
            marginLeft: 5,
            maxHeight: 200,
            fontSize: 13,
            overflow: "auto"
          }}
        >
          {this.state.item.description ? this.state.item.description :  "Not available" }
        </div>

        {/* Relateditems */}
        <div
          style={{
            marginTop: 30,
            marginBottom: 10,
            color: "gray",
            fontSize: 20
          }}
        >
          Related Items
        </div>
        {
          this.state.relatedItems.slice(0, 3).map(x => {
            return <Item key={x.id} item={x} />;
          })
        }
      </div >
    );
  }
}

let Details = connect()(ConnectedDetails);
export default Details;
