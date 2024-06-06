/**
 * This class sorts the array of input edges based on the associated angles. If
 * angles turn out to be the same, then we sort the edges based on their
 * in-cluster end nodes' orders in clockwise direction. This information is
 * calculated beforehand and stored in a matrix in each associated circle.
 *
 */

class CiSEInterClusterEdgeSort {
    constructor(ownerCircle, A){
        this.ownerCircle = ownerCircle;
        this._quicksort(A, 0, A.length - 1);
    }

    compareFunction(a, b){
        if(b.getAngle() > a.getAngle())
            return true;
        else if(b.getAngle() === a.getAngle())
        {
            if(a === b)
            {
                return false;
            }
            else
            {
                return this.ownerCircle.getOrder(
                    this.ownerCircle.getThisEnd(a.getEdge()),
                    this.ownerCircle.getThisEnd(b.getEdge()));
            }

        }
        else
        {
            return false;
        }
    }

    _quicksort(A, p, r){
        if(p < r) {
            let q = this._partition(A, p, r);
            this._quicksort(A, p, q);
            this._quicksort(A, q + 1, r);
        }
    }

    _partition(A, p, r){
        let x = this._get(A, p);
        let i = p;
        let j = r;
        while(true){
            while (this.compareFunction(x, this._get(A, j)))
                j--;
            while (this.compareFunction(this._get(A, i), x))
                i++;

            if (i < j){
                this._swap(A, i, j);
                i++;
                j--;
            }
            else
                return j;
        }
    }

    _get(object, index){
            return object[index];
    }

    _set(object, index, value){
            object[index] = value;
    }

    _swap(A, i, j){
        let temp = this._get(A, i);
        this._set(A, i, this._get(A, j));
        this._set(A, j, temp);
    }
}

module.exports = CiSEInterClusterEdgeSort;



