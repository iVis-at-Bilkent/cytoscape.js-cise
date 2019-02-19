let Quicksort = require('layout-base').Quicksort;
let LinkedList = require('layout-base').LinkedList;

function CiSEInterClusterEdgeSort(ownerCircle)
{
    this.ownerCircle = ownerCircle;
}

CiSEInterClusterEdgeSort.prototype = Object.create();

CiSEInterClusterEdgeSort.prototype.compare = function(a,b)
{
    let self = this;

    if(b.getAngle() > a.getAngle())
    {
        return true;
    }
    else if(b.getAngle() > a.getAngle())
    {
        if(a == b)
        {
            return false;
        }
        else
        {
            return self.ownerCircle.getOrder(
                self.ownerCircle.getThisEnd(a.getEdge()),
                self.ownerCircle.getThisEnd(b.getEdge()));
        }

    }
    else
    {
        return false;
    }
};

CiSEInterClusterEdgeSort.prototype.quicksort = function(list){

    let self = this;

    // input must be an instance of LinkedList class or must be an array in order to sort
    if (! ( (list instanceof LinkedList) || ( list instanceof Array))){
        return;
    }


    if (list instanceof LinkedList){
        end_index = list.size();
    }
    else if( list instanceof Array ){
        end_index = list.length-1;
    }

    // Prevent empty lists or arrays.
    if (end_index >= 0){
        self.quicksort_between_indices(list, 0, end_index);
    }

};


CiSEInterClusterEdgeSort.prototype.quicksort_between_indices = function(list, low, high){

    let self = this;

    // input must be an instance of LinkedList class or must be an array in order to sort
    if (! ( (list instanceof LinkedList) || ( list instanceof Array))){
        return;
    }


    let i = low;
    let j = high;
    let middleIndex = Math.floor( ( i + j ) / 2 );
    let middle = Quicksort.get_object_at(list, middleIndex);

    do
    {

        while (self.compare(Quicksort.get_object_at(list, i), middle)){

            i++;

        }

        while (self.compare(middle, Quicksort.get_object_at(list, j))){

            j--;

        }

        if (i <= j){

            let temp = Quicksort.get_object_at(list, i);
            Quicksort.set_object_at(list, i, Quicksort.get_object_at(list, j));
            Quicksort.set_object_at(list, j, temp);
            i++;
            j--;

        }

    } while (i<=j);

    if( low < j ){

        self.quicksort_between_indices(list, low, j, comparison_fn);

    }

    if( high > i){

        self.quicksort_between_indices(list, i, high, comparison_fn);

    }

};

module.exports = CiSEInterClusterEdgeSort;



